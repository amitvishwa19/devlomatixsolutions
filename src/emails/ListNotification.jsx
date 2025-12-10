import { Body, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import * as React from "react";



const baseUrl = process.env.VERCEL_URL
    ? `https://devlomatix.online`
    : "";

export default function ListNotification({ mailData }) {


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
                            <Text style={mainText}>{`Dear ${mailData.name}`}</Text>



                            {mailData.type === 'create' && <Heading style={h1}>{`Taskboard list ${mailData.title}  created successfully`}</Heading>}
                            {mailData.type === 'delete' && <Heading style={h1}>{`Taskboard list ${mailData.title}  deleted successfully`}</Heading>}
                            {mailData.type === 'title-update' &&
                                <Heading style={h1}>{`Taskboard ${mailData.boardTitle}'s list  ${mailData.oldTitle} is updated to ${mailData.updatedTitle} `}</Heading>
                            }


                            {
                                mailData.type === 'create' && (
                                    <Text style={mainText}>
                                        New Taskboard list created in your organizational workspace.
                                        Click {" "}
                                        <Link href={mailData.path} target="_blank" style={link}>
                                            {mailData.title}
                                        </Link>
                                        {" "}to access the taskboard.

                                    </Text>
                                )
                            }

                            {
                                mailData.type === 'delete' && (
                                    <Text style={mainText}>
                                        Thanks for using {mailData.title} . This Taskboard list is no longer active with your Organizational
                                        workspace, connect with admin for any query
                                    </Text>
                                )
                            }

                            {
                                mailData.type === 'title-update' && (
                                    <Text style={mainText}>
                                        Taskboard {mailData.boardTitle}'s list  {mailData.oldTitle} is updated to {mailData.updatedTitle} ,
                                        connect with admin for any query
                                    </Text>
                                )
                            }


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
