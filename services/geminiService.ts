
import { GoogleGenAI, Type } from "@google/genai";
import { JointState, JOINT_LIMITS } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client globally (if key exists)
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateRobotPose = async (
  currentJoints: JointState,
  prompt: string
): Promise<JointState | null> => {
  if (!ai) {
    console.error("Gemini API Key is missing");
    throw new Error("API Key is missing. Please check your configuration.");
  }

  const systemInstruction = `
    You are an expert roboticist controlling a Hyundai Robotics H220 6-axis industrial robot arm.
    This is a heavy-duty robot (220kg payload) typically used for spot welding, heavy handling, and assembly.
    
    The user may refer to axes using standard indices (J1-J6) or specific H220/Industrial aliases:
    - J1: "S" (Swivel)
    - J2: "H" (Horizontal / Lower Arm)
    - J3: "V" (Vertical / Upper Arm)
    - J4: "R2" (Forearm Roll)
    - J5: "B" (Bend / Wrist Pitch)
    - J6: "R1" (Wrist Twist/Roll)

    Current Joint State (Degrees):
    ${JSON.stringify(currentJoints)}

    H220 Joint Limits (Degrees):
    ${JSON.stringify(JOINT_LIMITS)}

    Task:
    Return a valid JSON object containing the target joint angles (j1, j2, j3, j4, j5, j6) based on the user's natural language request.
    
    Rules:
    1. STRICTLY respect the joint limits.
    2. Provide realistic poses. For example:
       - "Home" or "Ready" usually implies J2(H) at a slight angle and J3(V) bowing forward.
       - "Welding" implies the tool tip (J6/R1) is oriented towards a workpiece.
    3. If the user says "Move S axis" or "Rotate H", map them to the corresponding joints J1, J2, etc.
    4. Do NOT explain. ONLY return the JSON.
    5. If the request is dangerous or impossible, stay as close to current or safe state as possible.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            j1: { type: Type.NUMBER },
            j2: { type: Type.NUMBER },
            j3: { type: Type.NUMBER },
            j4: { type: Type.NUMBER },
            j5: { type: Type.NUMBER },
            j6: { type: Type.NUMBER },
          },
          required: ["j1", "j2", "j3", "j4", "j5", "j6"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) return null;

    const targetJoints = JSON.parse(jsonText) as JointState;
    return targetJoints;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
