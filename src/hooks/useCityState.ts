import { State, City, ICity } from "country-state-city"
import { useEffect, useState } from "react"

export const useCityState = () => {

    const [states, setStates] = useState(State.getStatesOfCountry('IN').map((item) => {return {value: item.name, code: item.isoCode, label: item.name}}))
    const [selectedState, setSelectedState] = useState<{value: string, label: string, code: string} | null>(null); 
    const [cities, setCities] = useState<{value: string, label: string}[] | null>(null)
    const [selectedCity, setSelectedCity] = useState<{value: string, label: string} | null>(null); 

    useEffect(() => {
        if (!selectedState) return; 
        const tempCities = City.getCitiesOfState('IN', selectedState.code).map((item) => {return {value: item.name, label: item.name}}); 

        setCities(tempCities); 
    }, [selectedState])

    return {
        states, setSelectedState, cities, setSelectedCity, selectedCity, selectedState
    }

}