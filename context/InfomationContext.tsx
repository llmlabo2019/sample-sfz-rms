'use client';
import { createContext, useContext, useState } from 'react';

const InfomationContext = createContext({
	message: '',
	show: false,
	setInfo: (msg: string) => {},
	clearInfo: () => {},
});

export const InfomationProvider = ({ children }: { children: React.ReactNode }) => {
	const [message, setMessage] = useState('');
	const [show, setShow] = useState(false);

	const setInfo = (msg: string) => {
		setMessage(msg);
		setShow(true);
	};

	const clearInfo = () => {
		setMessage('');
		setShow(false);
	};

	return (
		<InfomationContext.Provider value={{ message, show, setInfo, clearInfo }}>
			{children}
		</InfomationContext.Provider>
	);
};

export const useInfo = () => useContext(InfomationContext);
