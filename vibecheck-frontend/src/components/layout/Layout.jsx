import Header from './Header/Header';
import Footer from './Footer/Footer';
import './Layout.css';

function Layout({ children, hideProfileSection = false }) {
    return (
        <div className="layout">
            <Header hideProfileSection={hideProfileSection} />
            <main>{children}</main>
            <Footer />
        </div>
    );
}

export default Layout;