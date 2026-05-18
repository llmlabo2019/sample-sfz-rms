'use client';
import { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';

type DialogueContextType = {
	message: string;
	show: boolean;
	setDialogueMessage: (msg: string, redirectTo?: string) => void;
	clearDialogueMessage: () => void;
	confirmDialogueMessage: () => void;
};

const DialogueContext = createContext<DialogueContextType>({
	message: '',
	show: false,
	setDialogueMessage: () => {},
	clearDialogueMessage: () => {},
	confirmDialogueMessage: () => {},
});

export const DialogueProvider = ({ children }: { children: React.ReactNode }) => {
	const [message, setMessage] = useState('');
	const [show, setShow] = useState(false);
	const [redirectName, setRedirectName] = useState<string | null>(null);
	const router = useRouter();

	const setDialogueMessage = (msg: string, redirectTo?: string) => {
		setMessage(msg);
		setRedirectName(redirectTo ?? null);
		setShow(true);
	};

	const clearDialogueMessage = () => {
		setMessage('');
		setShow(false);
	};

	const confirmDialogueMessage = () => {
		setShow(false);
		setMessage('');
		if (redirectName) router.push(redirectName);
		setRedirectName(null);
	};

	return (
		<DialogueContext.Provider
			value={{
				message,
				show,
				setDialogueMessage,
				clearDialogueMessage,
				confirmDialogueMessage,
			}}
		>
			{children}
		</DialogueContext.Provider>
	);
};

export const useDialogue = () => useContext(DialogueContext);
