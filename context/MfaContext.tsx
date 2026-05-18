'use client';

import React, { createContext, useContext, useState } from 'react';

const MfaContext = createContext<any>(null);

export const MfaProvider = ({ children }: { children: React.ReactNode }) => {
	const [nextStep, setNextStep] = useState(null);

	return <MfaContext.Provider value={{ nextStep, setNextStep }}>{children}</MfaContext.Provider>;
};

export const useMfa = () => useContext(MfaContext);
