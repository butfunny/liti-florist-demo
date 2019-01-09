import React from "react";
import classnames from "classnames";
import {SelectColor} from "../select-color/select-color";
import uniq from "lodash/uniq"
import {productApi} from "../../api/product-api";
import {Select} from "../select/select";
export class SelectTagsColor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: "",
            colors: []
        };

        productApi.getColors().then((colors) => {
            this.setState({colors: colors.map(c => c.name)})
        })
    }

    render() {


        let {placeHolder, tags, isErrorTag, list, onChange, noPlaceholder, label, error} = this.props;
        let {selected, value, selectedIndex, selectedTag, focus, colors} = this.state;


        return (
            <div className={classnames("select-tags-color input-tag", error && "has-error", tags && tags.length > 0 && "has-value", selected && "focus")}>

                { tags.map((tagItem, index) => (
                    <div className="tag-item" key={index}>

                        <div className="tag-value"
                            style={{
                                background: tagItem,
                                width: "40px",
                                height: "19px",
                                borderRadius: "3px"
                            }}
                        />

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
                        list={colors.filter(item => tags.findIndex(t => t == item) == -1)}
                        displayAs={(color) => (
                            <div className="tag-value"
                                 style={{
                                     background: color,
                                     width: "100%",
                                     height: "19px",
                                     borderRadius: "3px"
                                 }}
                            />
                        )}
                    />
                </div>
            </div>
        );
    }
}