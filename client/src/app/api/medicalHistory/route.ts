// app/api/medicalHistory/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../lib/dbConnect";
import User from "../../models/user";
import axios from "axios";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { userId, patientId } = await request.json();

    if (!userId || !patientId) {
      return NextResponse.json(
        { error: "userId and patientId are required" },
        { status: 400 }
      );
    }

    // Validate userId format (assuming it's a MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      return NextResponse.json(
        { error: "Invalid userId format" },
        { status: 400 }
      );
    }

    const BASE_URL = "https://r4.smarthealthit.org";

    // Fetch data from FHIR server
    const [patientRes, conditionsRes, medsRes, obsRes] = await Promise.all([
      axios.get(`${BASE_URL}/Patient/${patientId}`).catch((err) => ({
        error: err.message,
        data: null,
      })),
      axios.get(`${BASE_URL}/Condition?patient=${patientId}`).catch((err) => ({
        error: err.message,
        data: { entry: [] },
      })),
      axios.get(`${BASE_URL}/MedicationRequest?patient=${patientId}`).catch((err) => ({
        error: err.message,
        data: { entry: [] },
      })),
      axios.get(`${BASE_URL}/Observation?patient=${patientId}`).catch((err) => ({
        error: err.message,
        data: { entry: [] },
      })),
    ]);

    // Check for errors in FHIR responses
    if (patientRes.error || !patientRes.data) {
      return NextResponse.json(
        { error: `Patient not found: ${patientRes.error || "Invalid patientId"}` },
        { status: 404 }
      );
    }

    const medicalHistory = {
      patient: patientRes.data,
      conditions: conditionsRes.data.entry || [],
      medications: medsRes.data.entry || [],
      observations: obsRes.data.entry || [],
      timestamp: new Date().toISOString(),
    };

    // Save to MongoDB - FIXED: Handle medicalHistory as object or array appropriately
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If medicalHistory is an object (old format), convert to array
    let updatedMedicalHistory;
    if (existingUser.medicalHistory && typeof existingUser.medicalHistory === 'object' && 
        !Array.isArray(existingUser.medicalHistory)) {
      // Convert from object to array format
      updatedMedicalHistory = [medicalHistory];
    } else {
      // Already an array or doesn't exist
      updatedMedicalHistory = [medicalHistory, ...(existingUser.medicalHistory || [])];
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        patientId,
        medicalHistory: updatedMedicalHistory,
      },
      { new: true }
    );

    // Return only necessary data
    return NextResponse.json({
      message: "Medical history fetched and stored successfully",
      medicalHistory,
    });

  } catch (error: any) {
    console.error("Error fetching/storing medical history:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to fetch/store medical history" },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}