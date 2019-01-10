import React from "react";
import {Input} from "../input/input";
import classnames from "classnames";
export class AutoCompleteNormal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: -1,
            selected: false,
            value: props.value || "",
        }
    }

    componentWillReceiveProps(props) {
        if (!props.value || props.value == "") {
            this.setState({value: ""})
        }

    }

    handleKeyDown(e) {

        let {selectedIndex} = this.state;
        let {onSelect, defaultList, value} = this.props;

        const filtered =  defaultList.filter(item => item.toLowerCase().indexOf(value.toLowerCase()) > -1);
        let index = selectedIndex;

        if (e.keyCode == 38) { // Up
            if (selectedIndex == -1) {
                if (filtered.length > 0) index = filtered.length - 1;
            } else {
                if (selectedIndex == 0) index = filtered.length - 1;
                else index = selectedIndex - 1;
            }
            e.preventDefault();
            e.stopPropagation();

        } else if (e.keyCode == 40) { // Down
            if (selectedIndex == -1) {
                if (filtered.length > 0) index = 0;
            } else {
                if (selectedIndex == filtered.length - 1) index = 0;
                else index = selectedIndex + 1;
            }
        } else if (e.keyCode == 13) { // Enter
            if (index != -1) {
                this.setState({
                    selectedIndex: -1,
                    selected: false,
                    value: filtered[index]
                });
                onSelect(filtered[index]);
            }
            return;
        }


        this.setState({
            selectedIndex: index
        })
    }



    render() {

        let {onSelect, displayAs, onChange, noPopup, defaultList, value, allowRemove, onRemove, className} = this.props;
        let {selected, selectedIndex} = this.state;
        const list = defaultList.filter(item => item.toLowerCase().indexOf(value.toLowerCase()) > -1);

        return (
            <div className={classnames("auto-complete", className)}>
                <Input
                    {...this.props}
                    className={null}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        this.setState({selected: true});
                    }}
                    onKeyDown={(e) => this.handleKeyDown(e)}
                    onFocus={() => this.setState({selected: true})}
                    onBlur={() => this.setState({selected: false})}
                    autocomplete="off"
                />



                {selected && list.length > 0 && (
                    <div className="dropdown-menu dropdown-menu-center show">
                        {list.map((item, index) => (
                            <a className={classnames("dropdown-item", selectedIndex == index && "active")}
                               onMouseEnter={() => this.setState({selectedIndex: index})}
                               onMouseLeave={() => this.setState({selectedIndex: -1})}
                               onMouseDown={() => {
                                   this.setState({value: item, selected: false});
                                   onSelect(item)
                               }}
                               key={index}>
                                {displayAs(item)}

                                { allowRemove && (
                                    <button className="btn btn-danger btn-sm"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onRemove(item);
                                            }}>
                                        <i className="fa fa-trash"/>
                                    </button>
                                )}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        );
    }
}