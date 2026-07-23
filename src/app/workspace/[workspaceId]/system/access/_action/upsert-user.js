'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";
import { slug } from "@/utils/functions";
import bcryptjs from "bcryptjs";

import { ensureAdmin } from "@/lib/auth-utils";

const UpsertUser = z.object({
  formData: z.any(),
});

const handler = async (data) => {
  const session = await ensureAdmin();
  const userId = session.user.userId;
  const { formData } = data
  let user


  try {

    const nroles = (formData.roles || []).map((i) => { return { id: i }; })
    // Departments relation removed as it is missing in User model schema

    // Use ID if available, otherwise use email as unique identifier
    const whereClause = formData.id && formData.id !== '' 
      ? { id: formData.id } 
      : { email: formData.email };

    // Hash password if provided
    let hashedPassword = undefined;
    if (formData.password && typeof formData.password === 'string' && formData.password.trim() !== '') {
      hashedPassword = await bcryptjs.hash(formData.password.trim(), 10);
    }

    const createData = {
      displayName: formData?.name,
      email: formData?.email,
      isActive: formData.status,
      ...(hashedPassword && { password: hashedPassword }),
      roles: {
        connect: nroles
      },
    };

    const updateData = {
      displayName: formData?.name,
      email: formData?.email,
      isActive: formData.status,
      ...(hashedPassword && { password: hashedPassword }),
      roles: {
        set: nroles
      },
    };

    user = await db.user.upsert({
      where: whereClause,
      create: createData,
      update: updateData,
      include: {
        roles: true,
      },
    })

    console.log('@user server action complete (No Departments)', user.email)

  } catch (error) {
    console.error('Upsert User Error:', error)
    return {
      message: error.message || "Oops!, something went wrong", 
      error
    }
  }

  return { data: { user } };

}


export const upsertUser = createSafeAction(UpsertUser, handler);