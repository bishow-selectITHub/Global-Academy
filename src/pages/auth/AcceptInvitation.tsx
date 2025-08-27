import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/ui/Toaster';

const AcceptInvitation = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const invitedEmail = useMemo(() => searchParams.get('email') || '', [searchParams]);
    const invitedName = useMemo(() => searchParams.get('name') || '', [searchParams]);
    const invitedRole = useMemo(() => (searchParams.get('role') || 'admin').toLowerCase(), [searchParams]);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const [emailFromSession, setEmailFromSession] = useState<string>('');
    const [nameFromSession, setNameFromSession] = useState<string>('');
    const [roleFromSession, setRoleFromSession] = useState<string>('admin');
    const tokenHash = useMemo(() => {
        const fromSearch = searchParams.get('token_hash') || '';
        if (fromSearch) return fromSearch;
        try {
            const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
            return hashParams.get('token_hash') || '';
        } catch (_) {
            return '';
        }
    }, [searchParams]);
    const linkType = useMemo(() => {
        const fromSearch = (searchParams.get('type') || '').toLowerCase();
        if (fromSearch) return fromSearch;
        try {
            const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
            return (hashParams.get('type') || '').toLowerCase();
        } catch (_) {
            return '';
        }
    }, [searchParams]);

    useEffect(() => {
        let mounted = true;
        let unsubscribe: (() => void) | undefined;

        const populateFromSession = (s: any) => {
            setEmailFromSession(s?.user?.email || invitedEmail);
            const md = s?.user?.user_metadata || {};
            setNameFromSession(md.name || invitedName || '');
            const extractedRole = ((md.role as string) || invitedRole || 'admin').toLowerCase();
            setRoleFromSession(extractedRole);

            console.log('🔍 [DEBUG] populateFromSession:', {
                sessionUser: s?.user?.email,
                metadata: md,
                extractedRole,
                invitedRole,
                finalRole: extractedRole
            });
        };

        const init = async () => {
            try {
                const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
                const typeFromHash = (hashParams.get('type') || '').toLowerCase();
                const tokenFromHash = hashParams.get('token_hash') || '';
                const isInviteStyle = typeFromHash === 'invite' && tokenFromHash;
                const isEmailOtpStyle = typeFromHash === 'email' && tokenFromHash;
                const isRecoveryStyle = typeFromHash === 'recovery' && tokenFromHash;
                const isSignupStyle = typeFromHash === 'signup' && tokenFromHash;
                const isMagicLinkStyle = tokenHash && linkType && !isInviteStyle && !isEmailOtpStyle && !isRecoveryStyle;

                if (isInviteStyle) {
                    await supabase.auth.verifyOtp({ token_hash: tokenFromHash, type: 'invite' as any });
                } else if (isEmailOtpStyle) {
                    await supabase.auth.verifyOtp({ token_hash: tokenFromHash, type: 'email' });
                } else if (isRecoveryStyle) {
                    await supabase.auth.verifyOtp({ token_hash: tokenFromHash, type: 'recovery' });
                } else if (isSignupStyle) {
                    await supabase.auth.verifyOtp({ token_hash: tokenFromHash, type: 'signup' as any });
                } else if (isMagicLinkStyle) {
                    await supabase.auth.verifyOtp({ token_hash: tokenHash, type: linkType as any });
                }
            } catch (_) {
                // ignore; we'll rely on session listener below
            }

            const { data } = await supabase.auth.getSession();
            if (!mounted) return;
            if (data.session) {
                populateFromSession(data.session);
                setSessionReady(true);
            }

            const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
                if (!mounted) return;
                if (session) {
                    populateFromSession(session);
                    setSessionReady(true);
                }
            });
            unsubscribe = listener?.subscription?.unsubscribe;

            // Fallback: poll briefly in case listener misses
            const deadline = Date.now() + 5000;
            const waitForSession = async () => {
                while (mounted && !sessionReady && Date.now() < deadline) {
                    const { data: s } = await supabase.auth.getSession();
                    if (s.session) {
                        populateFromSession(s.session);
                        setSessionReady(true);
                        break;
                    }
                    await new Promise((r) => setTimeout(r, 300));
                }
            };
            waitForSession();
        };
        init();
        return () => {
            mounted = false;
            try { unsubscribe && unsubscribe(); } catch (_) { }
        };
    }, [invitedEmail, invitedName, invitedRole, tokenHash, linkType]);

    const handleAccept = async () => {
        if (!sessionReady) return;
        if (!password || password.length < 8) {
            addToast({ type: 'error', title: 'Invalid password', message: 'Password must be at least 8 characters.' });
            return;
        }
        if (password !== confirmPassword) {
            addToast({ type: 'error', title: 'Passwords do not match', message: 'Please make sure both passwords match.' });
            return;
        }
        setIsLoading(true);
        try {
            // 1. Ensure current user
            const { data: userData, error: userErr } = await supabase.auth.getUser();
            if (userErr || !userData.user) throw userErr || new Error('Invalid or expired invitation link.');

            const userId = userData.user.id;
            const email = userData.user.email || invitedEmail;

            console.log('🔍 [DEBUG] Accepting invitation with:', {
                userId,
                email,
                invitedRole,
                roleFromSession,
                nameFromSession: nameFromSession || invitedName
            });

            // 2. Update password + metadata in one go
            const { error: updateErr } = await supabase.auth.updateUser({
                password,
                data: {
                    name: nameFromSession || invitedName,
                    role: roleFromSession,
                },
            });
            if (updateErr) throw updateErr;

            console.log('✅ [DEBUG] User metadata updated with role:', roleFromSession);

            // 3. Upsert profile row
            const profilePayload = {
                id: userId,
                name: nameFromSession || invitedName,
                email,
            };
            const { error: profileErr } = await supabase.from('users').upsert(profilePayload, { onConflict: 'id' });
            if (profileErr) throw profileErr;

            // 4. Insert role into user_roles if not already present
            const { data: existingRole, error: checkErr } = await supabase
                .from('user_roles')
                .select('id')
                .eq('user_id', userId)
                .eq('role', roleFromSession)
                .maybeSingle();
            if (checkErr) throw checkErr;

            if (!existingRole) {
                console.log('📝 [DEBUG] Inserting role into user_roles table:', { userId, role: roleFromSession });
                const { error: roleErr } = await supabase.from('user_roles').insert([{ user_id: userId, role: roleFromSession }]);
                if (roleErr) throw roleErr;
                console.log('✅ [DEBUG] Role inserted into user_roles table');
            } else {
                console.log('ℹ️ [DEBUG] Role already exists in user_roles table');
            }

            // 5. Re-login explicitly with email/password
            if (email) {
                console.log('🔄 [DEBUG] Re-logging in to refresh session...');
                await supabase.auth.signOut();
                const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
                if (signInErr) throw signInErr;
                console.log('✅ [DEBUG] Re-login successful');
            }

            addToast({ type: 'success', title: 'Invitation accepted', message: 'Your account is ready.' });

            // Navigate based on the actual role that was set
            const finalRole = roleFromSession.toLowerCase();
            let redirectPath = '/';

            if (finalRole === 'superadmin' || finalRole === 'admin' || finalRole === 'manager') {
                redirectPath = '/admin';
            } else if (finalRole === 'teacher') {
                redirectPath = '/teacher';
            } else {
                redirectPath = '/learner';
            }

            console.log(`🎯 Redirecting to ${redirectPath} based on role: ${finalRole}`);
            navigate(redirectPath, { replace: true });
        } catch (err: any) {
            addToast({ type: 'error', title: 'Could not accept invitation', message: err?.message || 'Try again.' });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div>
            <div className="mb-6 text-center relative">
                <Link
                    to="/"
                    className="absolute left-0 top-0 p-2 rounded-md hover:bg-slate-100 transition-colors"
                    title="Home"
                >
                    <Home size={20} className="text-slate-600 hover:text-slate-800" />
                </Link>
                <h2 className="text-2xl font-bold text-slate-900">Accept Invitation</h2>
                <p className="mt-2 text-sm text-slate-600">Set a password to activate your account.</p>
            </div>
            <div className="space-y-4">
                <Input
                    className='p-2'
                    id="email"
                    label="Email"
                    value={emailFromSession || invitedEmail}
                    fullWidth
                    disabled
                />
                <Input
                    id="password"
                    className='p-2'
                    type="password"
                    label="Password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                />
                <Input
                    className='p-2'
                    id="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                />
                <Button onClick={handleAccept} fullWidth isLoading={isLoading} disabled={!sessionReady}>
                    Activate Account
                </Button>
            </div>
        </div>
    );
};

export default AcceptInvitation;