import Header from './Header/Header';
import Footer from './Footer/Footer';
import './Layout.css';

function Layout({ children }) {
    return (
        <div className="layout">
            <Header />
            <main class>{children}</main>
            <Footer />
        </div>
    );
}

export default Layout;