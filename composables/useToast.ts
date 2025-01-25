import { Notyf } from "notyf";

const getToast = () => {
	return new Notyf({
		position: {
			x: "right",
			y: "top",
		},
	});
};

export const useToast = (toast: Notyf = getToast()) => {
	return {
		open: toast.open.bind(toast),
		success: toast.success.bind(toast),
		error: toast.error.bind(toast),
	};
};
