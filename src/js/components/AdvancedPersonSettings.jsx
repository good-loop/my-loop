import React from 'react';
import { Button } from 'reactstrap';
import { LoginCard, RolesCard } from '../base/components/AccountPageWidgets';
import SimpleTable from '../base/components/SimpleTable';
import Claim from '../base/data/Claim';
import Person, { deleteClaim, getAllXIds, getClaims, getEmail, getProfile, hasConsent, PURPOSES } from '../base/data/Person';
import Tree from '../base/data/Tree';
import Roles, { getRoles } from '../base/Roles';
import Login from '../base/youagain';
import LinkedProfilesCard from './cards/LinkedProfilesCard';


const AdvancedPersonSettings = () => {
	let xids = getAllXIds();
	const columns = [
		new Column({
			Header: "id",
			accessor: Person.getId,
			style: {maxWidth:"20em"}
		}),
		new Column({
			Header: "Name",
			accessor: peep => peep.std && peep.std.name,
			style: {maxWidth:"20em"}
		}),
		new Column({
			Header: "Created",
			accessor: peep => peep.created,
			type: "date"
		}),
		new Column({
			Header: "Property",
			accessor: "k",
			style: {maxWidth:"15em"}
		}),
		new Column({
			Header: "Claim",
			accessor: "v",
			style: {maxWidth:"20em"}
		}),
		new Column({
			Header: "Consent",
			accessor: "c",
			Cell: v => v && v.join(", "),
			style: {maxWidth:"20em"}
		}),
		new Column({
			ui: true,
			Header: "Delete",
			Cell: (a,b,c) => Claim.isa(c) && c.xid && 
				<Button onClick={e => deleteClaim({persons:[getProfile({xid:c.xid}).value], key:c.k})} size="xs" color="outline-danger">&times;</Button>
			// style: {maxWidth:"20em"}
		}),
		new Column({
			Header: "Date",
			accessor: "t"
		}),
		new Column({
			Header: "Segments",
			accessor: peep => Person.isa(peep) && getClaims({persons:[peep], key:"in"}).map(c => c.v).join(", "),
			style: {maxWidth:"20em"}
		}),
	];

	const dataTree = new Tree();
	// a branch per person, a leaf per claim
	xids.forEach(xid => {
		let pvPeep = getProfile({xid});
		let peep = pvPeep.value || {id:xid};
		console.log(peep);
		let peepBranch = Tree.add(dataTree, peep);
		let claims = Person.claims(peep);
		claims.forEach(c => {
			c = Object.assign({xid}, c); // add in the owner's xid
			Tree.add(peepBranch, c);
		});
	});

	return (<>
		<LoginCard />
		<RolesCard />
		<p>XIds: {JSON.stringify(xids)}</p>
		
		<h3>Claims</h3>
		<div style={{height:"75vh"}}><SimpleTable dataTree={dataTree} columns={columns} 
			tableName={"Claims"}			
			showSortButtons={false} 
			scroller 
			hasCollapse 
			hideEmpty={false}
			hasCsv /></div>

		<LinkedProfilesCard xids={xids} />
	</>);
};

export default AdvancedPersonSettings;
