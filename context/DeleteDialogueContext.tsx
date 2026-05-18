'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type DeleteDialogueContextType = {
	show: boolean;
	message: string;
	setDeleteDialogue: (message: string, onConfirm: () => void) => void;
	clearDeleteDialogue: () => void;
};

const DeleteDialogueContext = createContext<DeleteDialogueContextType>({
	show: false,
	message: '',
	setDeleteDialogue: () => {},
	clearDeleteDialogue: () => {},
});

export const DeleteDialogueProvider = ({ children }: { children: ReactNode }) => {
	const [show, setShow] = useState(false);
	const [message, setMessage] = useState('');
	const [onConfirmCallback, setOnConfirmCallback] = useState<() => void>(() => {});

	const setDeleteDialogue = (msg: string, onConfirm: () => void) => {
		setMessage(msg);
		setOnConfirmCallback(() => onConfirm);
		setShow(true);
	};

	const clearDeleteDialogue = () => {
		setShow(false);
		setMessage('');
		setOnConfirmCallback(() => {});
	};

	const confirm = () => {
		onConfirmCallback();
		clearDeleteDialogue();
	};

	return (
		<DeleteDialogueContext.Provider
			value={{ show, message, setDeleteDialogue, clearDeleteDialogue }}
		>
			{children}
			{show && (
				<div className="customdialogue">
					<div className="customdialogue__body">
						<div className="customdialogue__body__message">
							<p>{message}</p>
						</div>
						<div className="customdialogue__body__buttons">
							<button className="st_button" onClick={confirm}>
								削除する
							</button>
							<button className="sub_button" onClick={clearDeleteDialogue}>
								中止
							</button>
						</div>
					</div>
				</div>
			)}
		</DeleteDialogueContext.Provider>
	);
};

export const useDeleteDialogue = () => useContext(DeleteDialogueContext);
