
import PropertyDetails from './PropertyDetails'
import PageLayout from "../components/pagelayout/index";

const ApartmentPage = () => {
  return (
    <PageLayout
      children={
        <div className="">
          <PropertyDetails />
        </div>
      }
    />
  )
}

export default ApartmentPage
