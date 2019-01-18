import React from "react";
import classnames from "classnames";
import {SelectColor} from "../select-color/select-color";
import uniq from "lodash/uniq";
import {Select} from "../select/select";
export class SelectTags extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: null
        }
    }

    render() {

        let {placeholder, tags, isErrorTag, list, onChange, noPlaceholder, label, error, className, displayAs} = this.props;
        let {selected, value, selectedIndex, selectedTag, focus} = this.state;

        return (
            <div className={classnames("input-tag select-tags", error && "has-error", className, tags && tags.length > 0 && "has-value", selected && "focus")}>

                { tags.map((tagItem, index) => (
                    <div className="tag-item" key={index}>

                        {tagItem}

                        <a className="remove-tag" onClick={() => {
                            this.setState({selectedTag: null});
                            onChange(tags.filter(t => t != tagItem))
                        }}>
                            <span aria-hidden="true">×</span>
                        </a>
                    </div>
                ))}

                <div className="label"

                >
                    {label}
                </div>

                <div className="bar">
                    {label}
                </div>

                <div className="error">
                    {error}
                </div>

                <div className="input-wrapper auto-complete">
                    <Select
                        value={" "}
                        onChange={(item) => {
                            onChange(uniq(tags.concat(item)));
                        }}
                        list={list.filter(item => tags.findIndex(t => t == item) == -1)}
                    />
                </div>
            </div>

        );
    }
}