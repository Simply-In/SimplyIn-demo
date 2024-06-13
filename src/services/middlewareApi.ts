import axios from "axios";

interface IRequestBoodyCoordinates {
	lat: string, lng: string
}
interface IMiddlewareApi {
	endpoint: "checkout/submitEmail" | "checkout/resend-checkout-code-via-email" | "checkout/submitCheckoutCode" | "checkout/createUserData" | "userData" | "createOrder" | "addresses/find" | "parcelLockers/getClosest" | "checkout/checkIfSubmitEmailPushNotificationWasConfirmed",
	method: "GET" | "POST" | "PATCH",
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	requestBody: any
	token?: string
}


export const middlewareApi = ({ endpoint, method, requestBody, token, }: IMiddlewareApi) => {

	const urlBase = (document.getElementById('backendUrl') as HTMLInputElement)?.value
	const apiKey = (document.getElementById('apiKey') as HTMLInputElement)?.value


	const url = `${urlBase}/api/${endpoint}${token ? '?api_token=' + token : ''}`

	if (endpoint !== "parcelLockers/getClosest") {
		return axios({
			method: method,
			url: url,
			data: {
				apiKey: apiKey,
				shopVersion: "1.0",
				plugin_version: "1.0",
				shopUserEmail: undefined,
				...requestBody
			}
		}).then((response) => {
			return response.data
		})
	} else {
		return axios({
			method: method,
			url: url,
			data: {
				apiKey: apiKey,
				shopVersion: "1.0",
				plugin_version: "1.0",
				shopUserEmail: undefined,
				...requestBody,
				"acceptedParcelLockerProviders": [
					"inpost",
					"ruch",
					"poczta",
					"ups",
					"dhl",
					"dpd",
					"meest",
					"fedex",
					"orlen"
				],
				"coordinates": {
					"lat": (requestBody as IRequestBoodyCoordinates).lat,
					"lng": (requestBody as IRequestBoodyCoordinates).lng
				},
				"searchRadiusInMeters": 20000,
				"numberOfItemsToFind": 50
			}
		}).then((response) => {
			return response.data
		})

	}

}
