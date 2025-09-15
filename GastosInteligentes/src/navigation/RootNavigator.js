import React, {useEffect, useState} from "react";
import { NavigationContainer } from "@react-navigation/native";

import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";
import { useAuth } from "../context/AuthContext";

const RootNavigator = () => {
    const {loading, user} = useAuth();

    if(loading){
        return null;
    }

    return(
        <NavigationContainer>
            {user ? <AppNavigator/> : <AuthNavigator/>}
        </NavigationContainer>
    )
}

export default RootNavigator;