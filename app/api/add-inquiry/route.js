import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		const body = await request.json();

		await prisma.$executeRaw`CALL generate_dynamic_id('IQ', 'inquiries', @new_inquiry_id);`;
		const [result] = await prisma.$queryRaw`SELECT @new_inquiry_id AS new_id;`;
		const newInquiryId = result?.new_id?.toString();

		let newReferenceId = body.reference?.id;
		if (newReferenceId === 0) {
			await prisma.$executeRaw`CALL generate_dynamic_id('RF', 'the_references', @new_reference_id);`;
			const [referenceResponse] = await prisma.$queryRaw`SELECT @new_reference_id AS new_id;`;
			newReferenceId = referenceResponse?.new_id?.toString();
		}

		let newClientId = body.client?.id;
		if (newClientId === 0) {
			await prisma.$executeRaw`CALL generate_dynamic_id('CN', 'clients', @new_client_id);`;
			const [clientResponse] = await prisma.$queryRaw`SELECT @new_client_id AS new_id;`;
			newClientId = clientResponse?.new_id?.toString();
		}

		if (body.reference?.id === 0) {
			await prisma.the_references.create({
				data: {
					id: newReferenceId,
					name: body.reference.full_name,
					client_id: newClientId,
				},
			});
		}

		if (body.client?.id === 0) {
			await prisma.clients.create({
				data: {
					id: newClientId,
					name: body.client.full_name,
					reference_id: newReferenceId,
				},
			});
		}

		await prisma.inquiries.create({
			data: {
				id: newInquiryId,
				client_id: newClientId,
				reference_id: newReferenceId,
				main_project_id: body.mainProjectId,
				sub_project_id: body.subProjectId,
				contact_number: body.contactNumber,
				email_address: body.emailAddress,
				follow_ups: body.followUps,
				quote: body.quote,
				status: body.status,
				tags: body.tags,
				created_by: body.userId,
			},
		});

		await prisma.notes.create({
			data: {
				inquiry_id: newInquiryId,
				user_id: body.userId,
				content: body.note,
				source: "Inquiry",
			},
		});

		return NextResponse.json({ text: "Done" }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: error.message || "Failed to add new Inquiry." }, { status: 500 });
	}
}
