/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import Modal from '@mui/material/Modal';
import Step1 from './steps/Step1'
import Step2 from './steps/Step2';
import { CloseContainer, PopupContainer, PopupHeader, StyledBox } from './SimplyID.styled';
import { SimplyinSmsPopupOpenerIcon } from '../../assets/SimplyinSmsPopupOpenerIcon';
import { TypedLoginType } from './SimplyID';
import { StepRejected } from './steps/StepRejected';
import { CloseIcon } from '../../assets/CloseIcon';


interface IPinCodePopup {
	phoneNumber: string
	visible: boolean
	setVisible: (arg: boolean) => void
	setToken: any,
	simplyInput: string,
	loginType: TypedLoginType,
	setLoginType: any,
	userData: any,
	setUserData: any,
	modalStep: any,
	setModalStep: any,
	setSelectedUserData: any,
	setNotificationTokenId: any
}





//simply modal
export const PinCodeModal = ({ userData, setUserData, phoneNumber, visible, setVisible, setToken, simplyInput, loginType, modalStep, setModalStep, setSelectedUserData, setLoginType, setNotificationTokenId
}: IPinCodePopup) => {


	const [editItemIndex, setEditItemIndex] = useState<{ property: string, itemIndex: number, isNewData?: boolean } | null>(null)

	useEffect(() => {
		setSelectedUserData({
			...userData,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			billingAddresses: userData?.billingAddresses?.length ? userData?.billingAddresses[0] : {},
			shippingAddresses: null,
			parcelLockers: null
		})
	}, [userData])

	useEffect(() => {
		setModalStep(1)
	}, [phoneNumber])

	useEffect(() => {
		setToken("")
		setUserData({})
		setModalStep(1)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [simplyInput])


	const handleClosePopup = () => {
		setVisible(false)
	}



	return (<>
		{phoneNumber &&
			<Modal
				open={visible}
				onClose={() => setVisible(false)}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<StyledBox id="containerSimply" style={{ maxWidth: editItemIndex?.property === "parcelLockers" ? "650px" : "400px" }}>
					<PopupHeader>
						<SimplyinSmsPopupOpenerIcon style={{ marginBottom: "12px" }} />
						<CloseContainer onClick={handleClosePopup}>
							<CloseIcon />
						</CloseContainer>
					</PopupHeader>
					<PopupContainer style={{ margin: "8px 16px 16px" }}>
						{modalStep === 1 &&
							<Step1
								setToken={setToken}
								phoneNumber={phoneNumber}
								handleClosePopup={handleClosePopup}
								setModalStep={setModalStep}
								setUserData={setUserData}
								setSelectedUserData={setSelectedUserData}
								simplyInput={simplyInput}
								loginType={loginType}
								setLoginType={setLoginType}
								setNotificationTokenId={setNotificationTokenId}
							/>}
						{modalStep === 2 &&
								<Step2
									handleClosePopup={handleClosePopup}
									userData={userData}
									setUserData={setUserData}
									setSelectedUserData={setSelectedUserData}
									editItemIndex={editItemIndex}
									setEditItemIndex={setEditItemIndex}
								/>

						}
						{modalStep === "rejected" &&
							<StepRejected
							/>}
					</PopupContainer>
				</StyledBox>
			</Modal>
		}</>
	)
}

export default PinCodeModal
