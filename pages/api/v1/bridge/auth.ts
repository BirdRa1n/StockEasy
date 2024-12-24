import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/utils/supabase/api";

type Data = {
    name: string;
};

export default async function Handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
) {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ name: "Unauthorized" });
    }

    const supabase = createClient();

    // Check bridges table
    const { data, error } = await supabase
        .from("bridges")
        .select("code, team_id")
        .eq('code', token)
        .single();

    if (error || !data) {
        return res.status(401).json({ name: "Unauthorized" });
    }

    // Check teams table
    const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("name")
        .eq('id', data.team_id)
        .single();

    if (teamError || !teamData) {
        return res.status(401).json({ name: "Unauthorized" });
    }

    const response: any = {
        bridge: { code: data.code },
        team: { name: teamData.name }
    };

    res.status(200).json(response);
}
