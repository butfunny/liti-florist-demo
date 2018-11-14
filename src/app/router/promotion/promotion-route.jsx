import React from "react";
import {Layout} from "../../components/layout/layout";
export class PromotionRoute extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Layout
                activeRoute="Khuyến Mại">
                Promotion
            </Layout>
        );
    }
}