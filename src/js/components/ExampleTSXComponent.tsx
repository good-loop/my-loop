import React, { useState } from 'react';

//// COMPONENT DECLARATION ////
// We prefer functional components in our projects
// so we'll use this format:
const SimpleComponent: React.FC = () => <h1>This is a title!</h1>;
// Here we defined the type as `React.FC`. Notice that the return type
// is inferred from this (a functional component will always return a react node)
///////////////////////////////

//// PROPS ////
// We will define props using `type`
type Props = {
	name: string;
	customColour: string;
};

const ColourfulTitle: React.FC<Props> = ({name, customColour}) => {
	return <h1 style={{color: customColour}}>{name}</h1>;
};
// We define the variable type as FC<Props>. This is similar to other STed languages
// We'll prefer this signature for components over defining types next to the function's arguments
// because it's clearer and easier to navigate and hover over stuff for extra info when using
// the componenet elsewhere.
/////////////////


//// PROPS DOCS ////
// We will use JSDoc notation to document the individual props.
// The `?` symbol here means this is optional.
// The `|` union type allows us to specify multiple types.
type DocumentedProps = {
	/** background colour */
	color?: string;
	/** standard children prop: accept any valid React Node */
	text: string | number;
	/** callback function passed on to the handler */
	onClick: () => void;
}
// About function types: We will prefer annotating the signature like in the example above.
// (in this case: any function that takes no args and returns nothing)
// the alternative is using the `Function` in-built interface, which is useful when you do not have
// any info about the function taken, and no control over it, BUT most of the time we do know this
// and it's good to document it properly/avoid flaky hacks.

const Button: React.FC<DocumentedProps> = ({text, color = 'red', onClick}) => {
	return <button type="button" style={{backgroundColor: color}} onClick={onClick}>{text}</button>;
};
/////////////////////

//// FORM EVENTS ////
const MyInput: React.FC = () => {
	// Note that if you hover over useState you'll see the inferred type. This works great with almost
	// all hooks in react, due to their pure nature. If you wanted to specify multiple posible initial state types
	// you can do it like this: useState<string | number>(StringOrNumberValue) or create a specific `type`.
	const [value, setValue] = useState('');

	// An example using pre-defined html/react types. You can use a cheatsheet or rely on autocomplete to find the ones you need.
	const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setValue(e.target.value);
	};
	return <input value={value} onChange={onChange} id="super-input" />;
};
///////////////////


// We use our components as in normal JSX.
// We can hover or ctrl+click on any variable or component to see all the info related to it.
// We can also define a "go to types" hotkey, which by default is not assigned in VSCode.
const UsingComponents: React.FC = () => {
	return <>
		<SimpleComponent />
		<ColourfulTitle name="Hellooo!" customColour="red" />
		<Button color="green" onClick={(): void => console.log('hello!')} text={3} />
		<MyInput />
	</>;
};

export default UsingComponents;
