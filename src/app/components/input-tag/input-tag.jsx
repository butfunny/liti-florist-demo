import React from "react";
import classnames from "classnames";
import {Input} from "../input/input";

export class InputTag extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            value: "",
            selected: null,
            selectedIndex: -1,
            selectedTag: null
        }
    }



    handleUpDownKey(e) {
        let {list, onChange, tags} = this.props;
        let {selectedIndex, value} = this.state;

        const filtered = list.filter(item => tags.map(u => u.user_id).indexOf(item.user_id) == -1 && item.username.toLowerCase().indexOf(value.toLowerCase()) > -1);
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
                    value: ""
                });
                onChange(tags.concat(filtered[index]));
            }
            return;
        }


        this.setState({
            selectedIndex: index
        });
    }

    handleKey(e) {
        const enter = 13;
        const backspace = 8;
        const left = 37;
        const right = 39;
        const space = 32;
        const comma = 188;

        this.setState({error: false});

        if ([13, 38, 40].indexOf(e.keyCode) > -1) {
            this.handleUpDownKey(e);
        }

        if ([enter, left, right, backspace, comma, space].indexOf(e.keyCode) == -1) {
            this.setState({selectedTag : null});
            return;
        }

        let {onChange, tags} = this.props;
        let {selectedTag} = this.state;

        let removeTag = (keyCode) => {
            let index = tags.findIndex(t => t.user_id == selectedTag.user_id);

            if (keyCode == right) {
                if (index == tags.length - 1) this.setState({selectedTag: tags[0]});
                else this.setState({selectedTag: tags[index + 1]});
            } else if (keyCode == left) {
                if (index == 0) this.setState({selectedTag: tags[tags.length - 1]});
                else this.setState({selectedTag: tags[index - 1]});
            } else if (keyCode == backspace) {
                onChange(tags.filter(t => t.user_id != selectedTag.user_id));
                this.setState({selectedTag: null});
            }
        };

        let {value} = this.state;

        if (value.length == 0) {
            if (e.keyCode == backspace && selectedTag == null) {
                this.setState({selectedTag: tags[tags.length - 1]})
            } else if (selectedTag != null) removeTag(e.keyCode);

        }

    }



    render() {

        let {placeHolder, tags, isErrorTag, list, onChange} = this.props;
        let {selected, value, selectedIndex, selectedTag} = this.state;
        const filteredList = list.filter(item => tags.map(u => u.user_id).indexOf(item.user_id) == -1 && item.username.toLowerCase().indexOf(value.toLowerCase()) > -1);



        return (
            <div className="input-tag">
                { tags.map((tagItem, index) => (
                    <div className={classnames("tag-item", selectedTag && selectedTag.user_id == tagItem.user_id && "selected")} key={index}>
                        {tagItem.username}
                        <a className="remove-tag" onClick={() => {
                            this.setState({selectedTag: null});
                            onChange(tags.filter(t => t.user_id != tagItem.user_id))
                        }}>
                            <i className="fa fa-close"/>
                        </a>
                    </div>
                ))}

                <div className="input-wrapper auto-complete">
                    <input placeholder="Điền username tại đây"
                           className={classnames(this.state.error && "error-add")}
                           value={value}
                           onChange={(e) => this.setState({value: e.target.value})}
                           onKeyDown={(e) => this.handleKey(e)}
                           onFocus={() => this.setState({selected: true})}
                           onBlur={() => this.setState({selected: false})}
                           ref={elem => this.input = elem}
                    />

                    {selected && filteredList.length > 0 && (
                        <div className="dropdown-menu dropdown-menu-center show">
                            {filteredList.map((item, index) => (
                                <a className={classnames("dropdown-item", selectedIndex == index && "active")}
                                   onMouseEnter={() => this.setState({selectedIndex: index})}
                                   onMouseLeave={() => this.setState({selectedIndex: -1})}
                                   onMouseDown={() => {
                                       onChange(tags.concat(item));
                                       this.input.focus();
                                       this.setState({value: ""});
                                   }}
                                   key={index}>
                                    {item.username} - {item.name}
                                </a>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        );
    }
}