import React, { useEffect, useMemo } from 'react';
import {Row, Col, Container, Modal, ModalHeader, ModalBody, Button, Card } from 'reactstrap';
import TODO from '../../base/components/TODO';
import Campaign from '../../base/data/Campaign';

const ImpactCertificate= ({brand, impactDebit, campaign, charity, open, setOpen}) => {
    let charityName = charity.displayName || charity.name || charity.id;
    let charityDesc = charity.summaryDescription || charity.description
    
    let campaignName = campaign.name || brand.name || campaign.id;

    return (
        <Modal isOpen={open} className='cert-modal impact-cert' toggle={() => setOpen(!open)} size="xl">
            <ModalBody className='d-flex flex-row cert-body'>
                <div className='flex-column cert-col left justify-content-between'>
                    <div className='charity-description justify-content-between'>
                        <img src={charity.logo} />
                        <h4 className='text mt-5'>{charityName}</h4>
                        <p className='text mt-4'>{charityDesc}</p>
                        {charity.url && <p className='text mt-4'>Find out more: <a href={charity.url}>{charityName}</a></p>}
                    </div>
                    <div className='charity-SDG mt-5'>
                        <p className='text'>Primary UN SDG supported by {charityName}</p>
                        <TODO>where do we get these?</TODO>
                    </div>
                    <div className='charity-numbers mt-5 p-3'>
                        <TODO>where do we get these?</TODO>
                        <p className='text small-header'>{charityName} Projects</p>
                        <p className='text mt-1'>Registered charity number: ????????? </p>
                        <p className='text mt-1'>Company Number: ????????? </p>
                    </div>
                </div>

                <div className='flex-column cert-col right'>
                    <div className='brand-ngo-logos'>
                        <Row>
                            <img src={brand.branding.logo}/>
                            <p className='text top-text'>{campaignName}</p>
                        </Row>
                        <Row>
                            <img src={charity.logo || charity.altlogo}/>
                            <p className='text'>{charityName}</p>
                        </Row>
                    </div>

                    <div className='donation-details'>
                    </div>

                    <div className='donation-status'>

                    </div>

                    <div className='links'>

                    </div>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default ImpactCertificate;