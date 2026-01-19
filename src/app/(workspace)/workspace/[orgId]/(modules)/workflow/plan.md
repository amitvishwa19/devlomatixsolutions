enum PatientWorkflowStage {
  REGISTRATION
  TRIAGE
  CONSULTATION
  LAB_TEST
  PHARMACY
  BILLING
  DISCHARGE
}

model PatientWorkflow {
  id String @id @default(cuid())

  serverId String
  server   Server @relation(fields: [serverId], references: [id], onDelete: Cascade)

  patientId String
  patient   User @relation(fields: [patientId], references: [id], onDelete: Cascade)

  appointmentId String?
  appointment   Appointment? @relation(fields: [appointmentId], references: [id], onDelete: Cascade)

  stage PatientWorkflowStage

  isActive Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([serverId])
  @@index([patientId])
}

model PatientWorkflowHistory {
  id String @id @default(cuid())

  workflowId String
  workflow   PatientWorkflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)

  fromStage PatientWorkflowStage?
  toStage   PatientWorkflowStage

  note String?

  userId String? // who moved it (doctor / staff)
  user   User? @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())

  @@index([workflowId])
}