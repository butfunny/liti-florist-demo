import React from "react";
import {Input} from "../input/input";
import classnames from "classnames";
import debounce from "lodash/debounce";

export class AutoComplete extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: -1,
            selected: false,
            value: props.object[props.objectKey],
            list: [],
            loading: false
        }
    }

    componentWillReceiveProps(props) {
        if (!props.object[props.objectKey] || props.object[props.objectKey] == "") {
            this.setState({value: ""})
        }
    }

    handleKeyDown(e) {

        let {selectedIndex, list} = this.state;
        let {onSelect, objectKey} = this.props;

        const filtered = list;
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
                    value: filtered[index][objectKey]
                });
                onSelect(filtered[index]);
            }
            return;
        }


        this.setState({
            selectedIndex: index
        })
    }

    handleChange = debounce((value) => {
        let {asyncGet} = this.props;
        asyncGet(value).then(items => {
            this.setState({list: items, loading: false})
        })
    }, 300);


    render() {

        let {onSelect, displayAs, objectKey, onChange} = this.props;
        let {selected, selectedIndex, list, loading, value} = this.state;

        return (
            <div className="auto-complete">
                <Input
                    {...this.props}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        this.setState({value: e.target.value, loading: e.target.value.length > 0, list: [], selected: true});
                        if (e.target.value.length > 0) this.handleChange(e.target.value);
                    }}
                    onKeyDown={(e) => this.handleKeyDown(e)}
                    onFocus={() => this.setState({selected: true})}
                    onBlur={() => this.setState({selected: false})}
                />

                {loading && <i className="fa fa-spinner fa-pulse"/>}


                {!loading && selected && list.slice(0, 10).length > 0 && (
                    <div className="dropdown-menu dropdown-menu-center show">
                        {list.map((item, index) => (
                            <a className={classnames("dropdown-item", selectedIndex == index && "active")}
                               onMouseEnter={() => this.setState({selectedIndex: index})}
                               onMouseLeave={() => this.setState({selectedIndex: -1})}
                               onMouseDown={() => {
                                   this.setState({value: item[objectKey]});
                                   onSelect(item)
                               }}
                               key={index}>
                                {displayAs(item)}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        );
    }
}