import { Body, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import * as React from "react";



const baseUrl = process.env.VERCEL_URL
    ? `https://devlomatix.online`
    : "";

export default function RegisterationMail({ mailData }) {

    console.log('Mail data from template', mailData)
    return (
        <Html>
            <Head />

            <Body style={main}>
                <Container style={container}>
                    <Section style={coverSection}>
                        <Section style={imageSection}>
                            <Img
                                src={`${process.env.APP_LOGO_URL}`}
                                width="200"
                                height="45"
                                alt="Devlomatix's Logo"
                            />
                        </Section>
                        <Section style={upperSection}>
                            {/* <Text style={mainText}>{`Dear ${mailData?.user?.displayName}`}</Text> */}

                            <Heading style={h1}>{`Welcome to ${process.env.APP_NAME}`}</Heading>


                            <Text style={mainText}>
                                You are successfully registered with {process.env.APP_NAME}. Please verify your email address to activate your account.

                                Click {" "}
                                <Link href={`${process.env.APP_URL}/verify?token=${mailData.token}`} target="_blank" style={link}>
                                    here
                                </Link>

                                {" "}to activate your account.

                            </Text>


                            <Text style={mainText}>{`Team Devlomatix`}</Text>
                        </Section>
                        <Hr />
                        <Section style={lowerSection}>
                            <Text style={cautionText}>
                                Devlomatix Solutions will never email you and ask you to disclose
                                or verify your password, credit card, or banking account number.
                            </Text>
                        </Section>
                    </Section>
                    <Text style={footerText}>
                        This message was produced and distributed by Devlomatix Solutions,
                        Inc., 410 Terry Ave. North, Seattle, WA 98109. © 2022, Devlomatix Solutions, All rights reserved. Devlomatix is a registered trademark
                        of{" "}
                        <Link href="https://devlomatix.online" target="_blank" style={link}>
                            Devlomatix Solutions
                        </Link>
                        , Inc. View our{" "}
                        <Link href="https://devlomatix.online/privacy" target="_blank" style={link}>
                            privacy policy
                        </Link>
                        .
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: "#fff",
    color: "#212121",
};

const container = {
    padding: "20px",
    margin: "0 auto",
    backgroundColor: "#eee",
};

const h1 = {
    color: "#333",
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "15px",
};

const h2 = {
    color: "#333",
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "15px",
};

const link = {
    color: "#2754C5",
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "14px",
    textDecoration: "underline",
};

const text = {
    color: "#333",
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "14px",
    margin: "24px 0",
};

const imageSection = {
    backgroundColor: "#252f3d",
    display: "flex",
    padding: "20px 10px",
    alignItems: "center",
    justifyContent: "center",
};

const coverSection = { backgroundColor: "#fff" };

const upperSection = { padding: "25px 25px" };

const lowerSection = { padding: "25px 25px" };

const footerText = {
    ...text,
    fontSize: "12px",
    padding: "0 20px",
};

const verifyText = {
    ...text,
    margin: 0,
    fontWeight: "bold",
    textAlign: "center",
};

const codeText = {
    ...text,
    fontWeight: "bold",
    fontSize: "36px",
    margin: "10px 0",
    textAlign: "center",
};

const validityText = {
    ...text,
    margin: "0px",
    textAlign: "center",
};

const verificationSection = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const mainText = { ...text, marginBottom: "14px" };

const cautionText = { ...text, margin: "0px" };
