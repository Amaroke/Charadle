import { Container, Row, Col } from "react-bootstrap";
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <Container>
                <Row className="align-items-center">
                    <Col size={12} sm={6}>
                        <p className="copyright">
                            © 2023 Amaroke, all rights reserved.
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;