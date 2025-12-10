'use server'

import { db } from "@/lib/db"
import { MemberRole, ROLE } from "@prisma/client"
import { v4 as uuidv4 } from 'uuid'
export async function SeedDAtabase(type, data) {
    let user
    let server

    try {


        if (type === 'user') {
            data.forEach(async (item, index) => {
                user = await db.user.create({
                    data: {
                        firstName: item.firstName,
                        lastName: item.lastName,
                        email: item.email,
                        displayName: item.displayName,
                        avatar: item.avatar,
                        role: item.role,
                        uuid: 'US-' + Math.floor(Math.random() * (9999999999 - 1000000000 + 1) + 1000000000).toString(),
                        profile: {
                            create: {
                                firstname: item.firstName,
                                lastname: item.lastName,
                                displayname: item.displayName,
                                gender: item.gender,
                            }
                        }
                    }
                })

                if (user) {
                    user = await db.server.create({
                        data: {
                            userId: user.id,
                            name: 'default',
                            inviteCode: uuidv4(),
                            type: 'default',
                            default: true,
                            setting: {
                                create: {}
                            },
                            channels: {
                                create: [{ name: 'general', userId: user.id }]
                            },
                            members: {
                                create: [
                                    {
                                        userId: user.id,
                                        role: MemberRole.ADMIN
                                    }
                                ]
                            }
                        },

                    })
                }
            })
        }

        if (type === 'doctor') {
            data.forEach(async (item, index) => {
                user = await db.user.create({
                    data: {
                        firstName: item.firstName,
                        lastName: item.lastName,
                        email: item.email,
                        displayName: item.displayName,
                        avatar: item.avatar,
                        role: ROLE.DOCTOR,
                        uuid: 'DT-' + Math.floor(Math.random() * (9999999999 - 1000000000 + 1) + 1000000000).toString(),
                        profile: {
                            create: {
                                firstname: item.firstName,
                                lastname: item.lastName,
                                displayname: item.displayName,
                                gender: item.gender,
                            }
                        }
                    }
                })

                if (user) {
                    user = await db.server.create({
                        data: {
                            userId: user.id,
                            name: 'default',
                            inviteCode: uuidv4(),
                            type: 'default',
                            default: true,
                            setting: {
                                create: {}
                            },
                            channels: {
                                create: [{ name: 'general', userId: user.id }]
                            },
                            members: {
                                create: [
                                    {
                                        userId: user.id,
                                        role: MemberRole.ADMIN
                                    }
                                ]
                            }
                        },

                    })
                }
            })
        }

        if (type === 'patient') {
            data.forEach(async (item, index) => {
                user = await db.user.create({
                    data: {
                        firstName: item.firstName,
                        lastName: item.lastName,
                        email: item.email,
                        displayName: item.displayName,
                        avatar: item.avatar,
                        role: ROLE.PATIENT,
                        uuid: 'PT-' + Math.floor(Math.random() * (9999999999 - 1000000000 + 1) + 1000000000).toString(),
                        profile: {
                            create: {
                                firstname: item.firstName,
                                lastname: item.lastName,
                                displayname: item.displayName,
                                gender: item.gender,
                            }
                        }
                    }
                })

                if (user) {
                    user = await db.server.create({
                        data: {
                            userId: user.id,
                            name: 'default',
                            inviteCode: uuidv4(),
                            type: 'default',
                            default: true,
                            setting: {
                                create: {}
                            },
                            channels: {
                                create: [{ name: 'general', userId: user.id }]
                            },
                            members: {
                                create: [
                                    {
                                        userId: user.id,
                                        role: MemberRole.ADMIN
                                    }
                                ]
                            }
                        },

                    })
                }
            })
        }


        if (type === 'role') {
            await db.role.createMany({
                data: data
            })
        }

        if (type === 'permission') {
            await db.permission.createMany({
                data: data
            })
        }

    } catch (error) {
        console.log('Database seeder error', error)
    }
}