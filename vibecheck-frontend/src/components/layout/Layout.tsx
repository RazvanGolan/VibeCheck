import React, { ReactNode } from 'react';
import Header from '../Layout/Header/Header';
import Footer from '../Layout/Footer/Footer';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
  hideProfileSection?: boolean;
}

function Layout({ children, hideProfileSection = false }: LayoutProps) {
    return (
        <div className="layout">
            <Header hideProfileSection={hideProfileSection} />
            <main>{children}</main>
            <Footer />
        </div>
    );
}

export default Layout;