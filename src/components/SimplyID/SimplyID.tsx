/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, ChangeEvent, createContext, useMemo } from "react";
import { z } from 'zod'
import { useTranslation } from "react-i18next";
import { debounce } from 'lodash';
import { useAuth } from "../../hooks/useAuth";
import { useSelectedSimplyData } from "../../hooks/useSelectedSimplyData";
import { useCounterData } from "../../hooks/useCounterData";
import { middlewareApi } from "../../services/middlewareApi";
import { SimplyinContainer } from "./SimplyID.styled";
import { SimplyinSmsPopupOpenerIcon } from "../../assets/SimplyinSmsPopupOpenerIcon";
import PinCodeModal from "./PinCodeModal";




export const ApiContext = createContext<any>(null);
export const SelectedDataContext = createContext<any>(null);
export const CounterContext = createContext<any>({});

export const shortLang = (lang: string) => lang?.substring(0, 2).toUpperCase();
export const isValidEmail = (email: string) => z.string().email().safeParse(email).success

export type TypedLoginType = "pinCode" | "app" | undefined

export const SimplyID = () => {

	const [modalStep, setModalStep] = useState<1 | 2 | "rejected">(1)
	const [userData, setUserData] = useState({})
	const { t } = useTranslation();
	const [simplyInput, setSimplyInput] = useState("");
	
	const [visible, setVisible] = useState<boolean>(true)
	const [phoneNumber, setPhoneNumber] = useState("")
	const [notificationTokenId, setNotificationTokenId] = useState("")
	const [, setSelectedUserData] = useState({})
	const { i18n } = useTranslation();

	const [loginType, setLoginType] = useState<TypedLoginType>()
	const [counter, setCounter] = useState(0)
	const { authToken, setAuthToken } = useAuth()
	const {
		selectedBillingIndex,
		setSelectedBillingIndex,
		selectedShippingIndex,
		setSelectedShippingIndex,
		sameDeliveryAddress,
		setSameDeliveryAddress,
		selectedDeliveryPointIndex,
		setSelectedDeliveryPointIndex,
		pickupPointDelivery,
		setPickupPointDelivery
	} = useSelectedSimplyData();

	const {
		countdown,
		setCountdown,
		countdownError,
		setCountdownError,
		errorPinCode,
		setErrorPinCode,
		modalError,
		setModalError,
		countdownTime,
		setCountdownTime,
		countdownTimeError,
		setCountdownTimeError
	} = useCounterData();


	//opening simply modal
	const handleOpenSmsPopup = () => {
		setVisible((prev) => !prev)
	};

	//handling simply email field change 
	const handleSimplyInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSimplyInput(e.target.value)
	}

	const maxAttempts = 180 * 1000 / 500; // 180 seconds divided by 500ms

	useEffect(() => {

		if (!notificationTokenId || modalStep !== 1) {
			return
		}

		middlewareApi({
			endpoint: "checkout/checkIfSubmitEmailPushNotificationWasConfirmed",
			method: 'POST',
			requestBody: { "email": simplyInput.trim().toLowerCase(), "notificationTokenId": notificationTokenId, language: shortLang(i18n.language) }
		})
			.then(({ ok, rejected, authToken, userData }:{ok:boolean, rejected:boolean, authToken:string, userData:unknown}) => {
				if (authToken) {
					setAuthToken(authToken)
				}
				if (ok) {

					setUserData(userData as any);
					if ((userData as { language: string })?.language) {
						i18n.changeLanguage((userData as { language: string })?.language?.toLowerCase());
					}

					setVisible(true)
					setModalStep(2)

				} else if (ok === false && rejected === true) {
					setVisible(true)
					setModalStep("rejected")
				}
				else if (counter < maxAttempts) {
					setTimeout(() => setCounter((prev) => prev + 1), 1000);
				} else {
					console.log('Login not accepted within 30 seconds');
				}
			})
			.catch((error:Error) => {
				console.error('Error checking login status:', error);
			});


	}, [notificationTokenId, counter, visible])


	useEffect(() => {
		setVisible(false)
		setPhoneNumber("")
		setSelectedBillingIndex(0)
		setSelectedShippingIndex(null)
		setSelectedDeliveryPointIndex(null)
		setNotificationTokenId("")

		if (!authToken) {
			const debouncedRequest = debounce(() => {
				if (isValidEmail(simplyInput.trim().toLowerCase())) {
					middlewareApi({
						endpoint: "checkout/submitEmail",
						method: 'POST',
						requestBody: { "email": simplyInput.trim().toLowerCase(), language: shortLang(i18n.language) }
					}).then(({ data: phoneNumber, userUsedPushNotifications, notificationTokenId }:{data:any,userUsedPushNotifications:boolean, notificationTokenId:string}) => {


						setPhoneNumber(phoneNumber)
						setVisible(true)

						setLoginType(userUsedPushNotifications ? "app" : "pinCode")

						if (userUsedPushNotifications) {
							setNotificationTokenId(notificationTokenId)
						}
					}).catch((err: Error) => {
						console.log(err);
					})
						.catch((err: Error) => {
							console.log('my err', err);
						})
				}
			}, 500);

			debouncedRequest();
			return () => {
				debouncedRequest.cancel();
			};

		}
	}, [simplyInput]);


	useEffect(() => {

		const simplyinTokenInput = document.getElementById('simplyinTokenInput');
		const handleSimplyTokenChange = () => {
			setAuthToken((simplyinTokenInput as HTMLInputElement)?.value)
		}

		simplyinTokenInput?.addEventListener('input', handleSimplyTokenChange);

		return () => {
			simplyinTokenInput?.removeEventListener('input', handleSimplyTokenChange);

		};
	}, [])


	const providerProps = useMemo(() => {
		return {
			selectedBillingIndex,
			setSelectedBillingIndex,
			selectedShippingIndex,
			setSelectedShippingIndex,
			sameDeliveryAddress,
			setSameDeliveryAddress,
			selectedDeliveryPointIndex,
			setSelectedDeliveryPointIndex,
			pickupPointDelivery,
			setPickupPointDelivery
		}
	}, [selectedBillingIndex,
		setSelectedBillingIndex,
		selectedShippingIndex,
		setSelectedShippingIndex,
		sameDeliveryAddress,
		setSameDeliveryAddress,
		selectedDeliveryPointIndex,
		setSelectedDeliveryPointIndex,
		pickupPointDelivery,
		setPickupPointDelivery])


	const counterProps = useMemo(() => {
		return {
			countdown,
			setCountdown,
			countdownError,
			setCountdownError,
			errorPinCode,
			setErrorPinCode,
			modalError,
			setModalError,
			countdownTime,
			setCountdownTime,
			countdownTimeError,
			setCountdownTimeError
		}
	}, [countdown,
		setCountdown,
		countdownError,
		setCountdownError,
		errorPinCode,
		setErrorPinCode,
		modalError,
		setModalError,
		countdownTime,
		setCountdownTime,
		countdownTimeError,
		setCountdownTimeError])

	return (
		<ApiContext.Provider value={{ authToken, setAuthToken }}>
			<SelectedDataContext.Provider value={providerProps}>
				<CounterContext.Provider value={counterProps}>

					<div className="REACT_APP" style={{ margin: `10px 10px 10px ${phoneNumber ? 10 : -5}px` }}>

						<SimplyinContainer>
							<input autoComplete="off"
								value={simplyInput}
								onChange={handleSimplyInputChange}
								type="email"
								placeholder={t('emailPlaceholder')}
								style={{ flex: "1 1 auto" }}

							/>

							{phoneNumber &&
								<SimplyinSmsPopupOpenerIcon onClick={handleOpenSmsPopup} token={authToken} />
							} 
						</SimplyinContainer>

						{phoneNumber && <PinCodeModal

							setSelectedUserData={setSelectedUserData}
							modalStep={modalStep}
							setModalStep={setModalStep}
							userData={userData}
							setUserData={setUserData}
							simplyInput={simplyInput}
							setToken={setAuthToken}
							phoneNumber={phoneNumber}
							visible={visible}
							setVisible={setVisible}
							loginType={loginType}
							setLoginType={setLoginType}
							setNotificationTokenId={setNotificationTokenId}
						/>}
					</div >
				</CounterContext.Provider>
			</SelectedDataContext.Provider>
		</ApiContext.Provider>
	)
}

export default SimplyID


