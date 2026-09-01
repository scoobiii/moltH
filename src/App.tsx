import { MoltHLanding } from "./components/molth/MoltHLanding"
import { BusinessMeshTopology } from "./components/molth/BusinessMeshTopology"
export default function App(){
  return (
    <>
      <MoltHLanding/>
      <div className="p-8"><BusinessMeshTopology/></div>
    </>
  )
}
