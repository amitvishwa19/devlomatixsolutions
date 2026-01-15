import { Body, Container, Head, Html, Preview, Text } from '@react-email/components';
import * as React from 'react';


export const EnquiryEmail = ({ name }) => (
    <Html>
        <Head />
        <Preview>Welcome aboard, {name}!</Preview>
        <Body>
            <Container>
                <Text>Hello {name},</Text>
                <Text>
                    Welcome to Acme! We're excited to have you with us.
                </Text>
            </Container>
        </Body>
    </Html>
);
