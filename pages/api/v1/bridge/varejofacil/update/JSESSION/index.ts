'use server'
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/utils/supabase/api";

type Data = {
    name: string;
};

export default async function Handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
) {

    if (req.method !== 'POST') {
        res.status(405).json({ name: "Method Not Allowed" });
        return;
    }
    const { headers } = req;
    const token = headers["authorization"]?.split(" ")[1];
    console.log(token);

    const { JSESSION } = req.body;

    if (!JSESSION) {
        //faltou parametros
        res.status(400).json({ name: "Bad Request" });
        return;
    }

    if (token) {
        const supabase = createClient();

        //consultar tabela bridges
        const { data, error } = await supabase
            .from("bridges")
            .select("*")
            .eq('code', token);

        if (error) {
            console.log(error);
            res.status(401).json({ name: "Unauthorized" });
            return;
        }

        if (data.length > 0) {
            const bridge = data[0];

            const { data: team_data, error: team_error } = await supabase
                .from("teams")
                .select("*")
                .eq('id', bridge?.team_id);

            if (team_data) {
                const team = team_data[0];
                let config = team?.config;
                config.JSESSION = JSESSION;

                const { error } = await supabase
                    .from("teams")
                    .update({ config: config })
                    .eq('id', team?.id);
                if (error) {
                    console.log(error);
                    res.status(500).json({ name: "Internal Server Error" });
                    return;
                }

                res.status(200).json({ name: "OK" });
                return;
            }
        }
        res.status(401).json({ name: "Unauthorized" });
    } else {
        res.status(401).json({ name: "Unauthorized" });
    }
}
