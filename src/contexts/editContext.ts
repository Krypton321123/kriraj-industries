'use client'
import { createContext, useContext } from 'react'; 

type EditContext = {
    editing: boolean, 
    editingId: string | null, 
    setEditing: (editing: boolean) => void, 
    setEditingId: (editingId: string | null) => void, 
    editingFor: string | null, 
    setEditingFor: (editingFor: string ) => void
}
export const EditContext = createContext<EditContext | undefined>(undefined); 

export const useEditContext = () => {
    const context = useContext(EditContext); 
    if (!context) {
        throw new Error('Edit context should be within provider')
    }
    return context; 
}