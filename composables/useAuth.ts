import type { Auth, User } from "firebase/auth";
import {
	createUserWithEmailAndPassword,
	getAuth,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
} from "firebase/auth";
import { computed, ref } from "vue";

export function useAuth(auth: Auth = getAuth()) {
	// ********************************************************
	// * data
	// ********************************************************
	const user = ref<User | null>(auth.currentUser);
	const isAuthed = computed(() => !!user.value);

	// idTokenが変化したら更新する
	auth.onIdTokenChanged((authUser) => {
		user.value = authUser;
	});

	// ********************************************************
	// * methods
	// ********************************************************
	// 認証状態チェック
	async function checkAuthState() {
		try {
			const _user = await _checkAuthState(auth);
			user.value = _user;
		} catch (error) {
			user.value = null;
		}
		console.log("checkAuthState", user.value);
	}

	// メールアドレスとパスワードで登録
	async function registerEmailPassword(email: string, password: string) {
		const auth = getAuth();
		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password,
			);
			const user = userCredential.user;
			console.log("register success", user);
			await checkAuthState();
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	// ログイン
	async function loginEmailPassword(email: string, password: string) {
		const auth = getAuth();
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password,
			);
			const user = userCredential.user;
			console.log("login success", user);
			await checkAuthState();
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	// ログアウト
	async function logout() {
		try {
			await signOut(auth);
			user.value = null;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	return {
		isAuthed,
		user,
		checkAuthState,
		registerEmailPassword,
		loginEmailPassword,
		logout,
	};
}

// ********************************************************
// * utils
// ********************************************************
// onAuthStateChangedのPromise版Util
async function _checkAuthState(auth: Auth) {
	return new Promise<User | null>((resolve, reject) => {
		// client only
		if (!process.client) return resolve(null);

		onAuthStateChanged(
			auth,
			(user) => resolve(user || null),
			(error) => reject(error),
		);
	});
}
