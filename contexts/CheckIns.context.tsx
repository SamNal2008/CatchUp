import { getCheckInsRepository, CheckInsRepository } from "@/app/repositories/check-ins/CheckIns.repository";
import { useSQLiteContext } from "expo-sqlite";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface CheckInsContextProps {
    checkInsRepository: CheckInsRepository;
};

const CheckInsContext = createContext<CheckInsContextProps | null>(null);

export const useCheckIns = () => {
    const context = useContext(CheckInsContext);
    if (!context) throw new Error('Context should be defined');
    return context;
}

export const CheckInsProvider = ({children}: {children: ReactNode}) => {
    const db = useSQLiteContext();
    const checkInsRepository: CheckInsRepository = getCheckInsRepository(db);

    return (
        <CheckInsContext.Provider value={{checkInsRepository}}>
            {children}
        </CheckInsContext.Provider>
    );
};