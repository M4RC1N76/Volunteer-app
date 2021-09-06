import React from 'react'
import Logo from './StaLogo'
import { FontAwesome } from '@expo/vector-icons';
import styled from 'styled-components/native';



const TopOfApp = () => {

    const TopView = styled.View`
    color: ${props => props.theme.colors.staBlack};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    `

    const BurgerView = styled.View`
        background: ${props => props.theme.colors.appBackground};
        margin-right: 16px;
        margin-top: 10px;
        
    `

    return (
        <TopView>
            <Logo />
            <BurgerView>
                <FontAwesome name="bars" size={32}/>  
            </BurgerView>
            
        </TopView>
    )
}

export default TopOfApp
