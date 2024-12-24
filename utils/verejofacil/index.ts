import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from "@supabase/supabase-js";
import { createClient } from "../supabase/api";

const GetProduct = async (JSESSION: string, subdomain: string, value: string) => {

    try {
        const supabase = createClient();

        //verificar a existencia dos parametros
        if (!subdomain || !JSESSION) {
            throw new Error('Subdomain or JSESSION not found');
        }

        const { data, error } = await supabase.functions.invoke('varejofacil-get-produto', {
            body: { subdomain, JSESSION, codigo: value }
        });

        if (error) {
            if (error instanceof FunctionsHttpError) {
                const errorMessage = await error.context.json()

                console.log(errorMessage)
                if (error.context.status === 500) {
                    throw new Error('varejo facil unavailable');
                } else {
                    //produto nao encontrado
                    throw new Error('produto não encontrado');
                }
            } else if (error instanceof FunctionsRelayError) {
                console.log('Relay error:', error.message)
            } else if (error instanceof FunctionsFetchError) {
                console.log('Fetch error:', error.message)
            }
            throw new Error(error.message || 'Error invoking function');
        }

        return data;
    } catch (error) {
        switch (error) {
            case 'varejo facil unavailable':
                throw 500;
            case 'produto não encontrado':
                throw 404;
            default:
                throw 500;
        }
    }
}

export default GetProduct