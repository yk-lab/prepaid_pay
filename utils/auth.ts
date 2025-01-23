import { FirebaseError } from "firebase/app";

export const handleAuthCheck = async () => {
	if (!process.client) return null;

	const loading = ref(true);
	const { isAuthed, checkAuthState } = useAuth();

	try {
		await checkAuthState();
		return isAuthed.value;
	} catch (error) {
		console.error("認証状態の確認に失敗しました:", error);
		return null;
	} finally {
		loading.value = false;
	}
};

export const getAuthErrorMessage = (error: Error): string => {
	if (!(error instanceof FirebaseError)) {
		return "予期せぬエラーが発生しました。";
	}

	switch (error.code) {
		case "auth/invalid-email":
			return "メールアドレスの形式が正しくありません。";
		case "auth/user-disabled":
			return "このアカウントは無効になっています。";
		case "auth/user-not-found":
			return "メールアドレスまたはパスワードが間違っています。";
		case "auth/wrong-password":
			return "メールアドレスまたはパスワードが間違っています。";
		case "auth/email-already-in-use":
			return "このメールアドレスは既に使用されています。";
		case "auth/operation-not-allowed":
			return "この操作は許可されていません。";
		case "auth/weak-password":
			return "パスワードが弱すぎます。";
		default:
			return "認証エラーが発生しました。";
	}
};
