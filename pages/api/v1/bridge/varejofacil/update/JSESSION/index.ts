import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/utils/supabase/api";

type Data = {
    name: string;
};

export default async function Handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ name: "Method Not Allowed" });
    }

    const token = req.headers["authorization"]?.split(" ")[1];
    const { JSESSION } = req.body;

    if (!JSESSION) {
        return res.status(400).json({ name: "Bad Request" });
    }

    if (!token) {
        return res.status(401).json({ name: "Unauthorized" });
    }

    const supabase = createClient();
    const { data: bridgeData, error: bridgeError } = await supabase
        .from("bridges")
        .select("team_id")
        .eq('code', token)
        .single();

    if (bridgeError || !bridgeData) {
        return res.status(401).json({ name: "Unauthorized" });
    }

    const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("id, config")
        .eq('id', bridgeData.team_id)
        .single();

    if (teamError || !teamData) {
        return res.status(401).json({ name: "Unauthorized" });
    }

    const updatedConfig = { ...teamData.config, JSESSION };
    const { error: updateError } = await supabase
        .from("teams")
        .update({ config: updatedConfig })
        .eq('id', teamData.id);

    if (updateError) {
        console.log(updateError);
        return res.status(500).json({ name: "Internal Server Error" });
    }

    res.status(200).json({ name: "OK" });
}
