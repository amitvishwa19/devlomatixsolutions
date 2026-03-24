import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Button, Tailwind } from '@react-email/components';

export const InviteEmailTemplate = ({ inviteUrl, workspaceName = "Our Workspace" }) => {
    return (
        <Html>
            <Head />
            <Preview>You have been invited to join {workspaceName}</Preview>
            <Tailwind>
                <Body className="bg-gray-50 my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] bg-white">
                        <Section className="mt-[32px]">
                            <Text className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                                <strong>Join {workspaceName}</strong>
                            </Text>
                            <Text className="text-black text-[14px] leading-[24px]">
                                Hello,
                            </Text>
                            <Text className="text-black text-[14px] leading-[24px]">
                                You have been invited to join <strong>{workspaceName}</strong>. 
                                Click the button below to accept the invitation and access the workspace.
                            </Text>
                            <Section className="text-center mt-[32px] mb-[32px]">
                                <Button
                                    className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                    href={inviteUrl}
                                >
                                    Accept Invitation
                                </Button>
                            </Section>
                            <Text className="text-black text-[14px] leading-[24px]">
                                Or copy and paste this URL into your browser: <br />
                                <a href={inviteUrl} className="text-blue-600 no-underline">
                                    {inviteUrl}
                                </a>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default InviteEmailTemplate;
