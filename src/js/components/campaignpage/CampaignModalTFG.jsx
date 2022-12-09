import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Row, Col, Container } from 'reactstrap';
import Counter from '../../base/components/Counter';
import WhiteCircle from './WhiteCircle';
import printer from '../../base/utils/printer';
import { space, scrollTo } from '../../base/utils/miscutils';
import ShareButton from '../ShareButton';
import DevLink from './DevLink';
import MDText from '../../base/components/MDText';
import KStatus from '../../base/data/KStatus';
import LinkOut from '../../base/components/LinkOut';
import ServerIO from '../../plumbing/ServerIO';
import Campaign from '../../base/data/Campaign';
import DynImg from '../../base/components/DynImg';
import { T4GSignUpButton, T4GSignUpModal, T4GPluginButton } from '../T4GSignUp';
import C from '../../C';


const ModalCTA = ({ modalOpen, setModalOpen, branding, nvertiserName }) => {
	return (
		<Modal className="modal-CTA-T4G" isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} fade={true} size="lg" returnFocusAfterClose={false}>
			<ModalBody className="cta-modal-body">
				<Container className='modal-container'>
					<div className='modal-content'>
						<Row className='modalHeader'><button type="button" class="modal-close-button btn-lg" aria-label="Close" onClick={e => setModalOpen(false)}>
							<p className='modal-close-text'>close&emsp;<span style={{ fontWeight: "bold" }}>X</span></p>
						</button>
						</Row>
						<Row>
							<div className='modal-content-col' style={{ alignContent: 'center' }}>
								<p className="modal-text-intro subtext">{nvertiserName + " worked with Good-Loop to turn their advert into a force for good - with your help"}</p>
								<WhiteCircle width={"20%"} className="modal-gl-logo-circle">
									<img className='modal-gl-logo' src='/img/my_good-loop_Colour_RoundLogo.svg' alt='good-loop logo' />
								</WhiteCircle>
								<WhiteCircle width={"70%"} className="modal-middle-circle">
									<p className='red-text' style={{ color: "@gl-red" }}>Here's How You Can Keep Involved...</p>
									<p>Get the Tabs For Good browser extension and raise money for the causes you care the most about - <span className='text-red'>for free</span></p>
									<img className='modal-overlay-sm modal-overlay' src='/img/overlay-mobile.png' alt="showcase photos"></img>
									<img className='modal-overlay-lg modal-overlay' src='/img/overlay-desktop.png' alt="showcase photos"></img>
								</WhiteCircle>
								<T4GSignUpButton className='modal-tfg-signup-btn' />
								<p><a className='modal-cta-howItWorks' href="/tabsforgood"><span style={{ textDecoration: "underline" }}>How it works</span>&ensp;➞</a></p>
							</div>
						</Row>
					</div>
				</Container>
			</ModalBody>
		</Modal>)
}

export default ModalCTA;
