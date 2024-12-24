import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/utils/supabase/api";
import GetProduct from "@/utils/verejofacil";

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
                const config = team?.config;

                try {
                    const data = await GetProduct(config?.JSESSION, config?.subdomain, '1');

                    res.status(200).json(data);
                } catch (error) {
                    switch (error) {
                        case 500:
                            res.status(500).json({ name: "varejo facil unavailable" });
                            break;
                        case 404:
                            res.status(500).json({ name: "varejo facil unavailable" });
                            break;
                        default:
                            res.status(500).json({ name: "varejo facil unavailable" });
                    }
                }
            }
        }
        res.status(401).json({ name: "Unauthorized" });
    } else {
        res.status(401).json({ name: "Unauthorized" });
    }
}
