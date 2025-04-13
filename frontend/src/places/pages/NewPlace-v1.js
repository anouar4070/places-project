import React, { useCallback, useReducer } from "react";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../shared/util/validators";
import "./PlaceForm.css";

// Reducer function to manage form state
const formReducer = (state, action) => {
  switch (action.type) {
    case "INPUT_CHANGE": // Triggered when the user types in an input field
      let formIsValid = true;

      // Loop through all inputs to check overall form validity
      for (const inputId in state.inputs) {
        if (inputId === action.inputId) {
          formIsValid = formIsValid && action.isValid; // Validate the updated input field
        } else {
          formIsValid = formIsValid && state.inputs[inputId].isValid; // Keep the validity of other fields
        }
      }
      return {
        ...state, // Keep the existing state
        inputs: {
          ...state.inputs, // Copy existing inputs
          [action.inputId]: { value: action.value, isValid: action.isValid }, // Update only the modified input
        },
        isValid: formIsValid, // Update overall form validity
      };
    default:
      return state; // Return the current state if no matching action is found
  }
};

const NewPlace = () => {
  // useReducer initializes form state and provides a dispatch function to update it
  const [formState, dispatch] = useReducer(formReducer, {
    inputs: {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
      address: { value: "", isValid: false }, // add the address
    },
    isValid: false, // The overall form validity
  });

  // Function to handle input changes, wrapped in useCallback to prevent unnecessary re-renders
  const inputHandler = useCallback((id, value, isValid) => {
    dispatch({
      type: "INPUT_CHANGE", // Dispatch an action to update the state
      value: value,
      isValid: isValid,
      inputId: id, // The input field identifier (title, description, address)
    });
  }, []);

  const placeSubmitHandler = (event) => {
    event.preventDefault();
    console.log(formState.inputs); // send this to the backend!
  };

  return (
    <form className="place-form" onSubmit={placeSubmitHandler}>
      <Input
        id="title"
        element="input"
        type="text"
        label="Title"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a valid title."
        onInput={inputHandler}
      />
      <Input
        id="description"
        element="textarea"
        label="Description"
        validators={[VALIDATOR_MINLENGTH(5)]}
        errorText="Please enter a valid description (at least 5 characters)."
        onInput={inputHandler}
      />
      <Input
        id="address"
        element="input"
        label="Address"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a address."
        onInput={inputHandler}
      />
      <Button type="submit" disabled={!formState.isValid}>
        ADD PLACE
      </Button>
    </form>
  );
};

export default NewPlace;

/** 
state.inputs[inputId] refers to "the object corresponding to this field".  
For example:  
 
state.inputs["title"] → { value: "My Place", isValid: true }  
state.inputs["description"] → { value: "", isValid: false }  
state.inputs["address"] → { value: "", isValid: false }  
 
And state.inputs[inputId].isValid gives the validity of the field:  
 
state.inputs["title"].isValid → true  
state.inputs["description"].isValid → false  
state.inputs["address"].isValid → false  
 
**The value of action.isValid changes depending on the field currently being modified by the user:**  
 
- If the user enters a valid value, action.isValid = true.  
- If the user enters an invalid value, action.isValid = false.  
 
💡 **General rule:** action.isValid represents the validity of the field currently being modified (the one corresponding to action.inputId). 🚀  
*/
