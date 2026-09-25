import client from "./client";
import { BASE_URL } from "../config";

export const ApiCall = async ({ params, route, verb, token, baseurl }) => {
  try {
    const url = baseurl === false ? route : `${BASE_URL}/${route}`;
    const method = verb?.toLowerCase();
    if (!["get", "post", "put", "patch", "delete"].includes(method)) {
      return { status: 400, response: "Method not found" };
    }

    const result = await client.request({
      url,
      method,
      params: method === "get" || method === "delete" ? params : undefined,
      data: method === "get" || method === "delete" ? undefined : params,
    });
    return { status: result.status, response: result.data };
  } catch (error) {
    return {
      status: error.response ? error.response.status : 400,
      response: error.response
        ? error.response.data
        : { message: error.toString() },
    };
  }
};
