import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@radix-ui/react-navigation-menu";
import { memo } from "react";
import { navigationMenuTriggerStyle } from "./ui/navigation-menu";
import { Link } from "react-router-dom";
import ninjaIcon from "../assets/ninja-logo.png";

interface NavbarProps { }

const Navbar: React.FC<NavbarProps> = () => {
  return (
    <NavigationMenu className='bg-black py-2'>
      <NavigationMenuList className='flex flex-row'>
        <NavigationMenuItem className="flex px-4 text-white">
          <NavigationMenuLink className="flex">
            <Link to="/" className="flex items-center gap-x-3">
              <img className="w-8" src={ninjaIcon} alt="Logo" />
              DomainNinja
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className="ml-auto flex gap-x-2 px-8">
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            <Link to="/commit">Commit</Link>
          </NavigationMenuLink>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            <Link to="/reveal">Reveal</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default memo(Navbar);
