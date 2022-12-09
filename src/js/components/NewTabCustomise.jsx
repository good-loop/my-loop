/* global navigator */
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { T4GLayoutPicker, T4GLayoutSelector, T4GThemePicker } from './NewTabLayouts';
import { TutorialComponent } from './NewtabTutorialCard';


export const NewTabCustomise = ({ modalOpen, setModalOpen }) => {
	return (
		<>
			<Modal className="customise-modal" isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} fade={true} size="lg">
				<ModalBody className="customise-modal-body">
					<Container>
						<h1> Select a Theme </h1>
						<T4GThemePicker />
						<br />
						<h1> Select a layout </h1>
						<T4GLayoutPicker />
						<br />
					</Container>
				</ModalBody>
			</Modal>
			<TutorialComponent page={6} className="t4g-customizer">
				<Button className="t4g-customise-button" onClick={(e) => setModalOpen(true)}><img className="customise-btn-img" src="../img/icons/edit-icon.svg" /></Button>
			</TutorialComponent>
		</>
	)
}