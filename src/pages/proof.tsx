import { generateProof } from "@semaphore-protocol/proof";
import { Link } from "@tanstack/react-location";
import { ethers } from "ethers";
import { useMetaMask } from "metamask-react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { GROUP_ID, SUPPORTED_NETWORK } from "../constants";
import { contractStore, useWalletSigner } from "../contracts";
import { useConnectedSemaphore, useSemaphore } from "../providers/semaphore.provider";

function ProofPage() {
    const { status } = useMetaMask();
    const { id, hasJoined } = useSemaphore();

    if (!id) {
        return (
          <div>
            <div>
              You need to have generated an ID at step 1 before continuing here!
            </div>
            <Link
              className="mt-4 self-center hover:underline hover:underline-offset-2"
              to="/identity"
            >
              {'<-'} First stop: Identity
            </Link>
          </div>
        );
      }

    if (!hasJoined) {
        return (
          <div>
            <div>
              You need to belong to the group before continuing here!
            </div>
            <Link
              className="mt-4 self-center hover:underline hover:underline-offset-2"
              to="/group"
            >
              {'<-'} Second stop: Group
            </Link>
          </div>
        );
      }

      if (status !== 'connected') {
        return (
          <div>
            <div>You need to be connected in order to go on here!</div>
          </div>
        );
      }

      return (
        <div className="w-full px-16 py-8">
            <Link className="hover:underline hover:underline-offset-2" to="/identity">
                {'<-'} Back to group
            </Link>
            <div className="flex flex-col items-center">
                <div className="text-2xl mb-8">Stop #3 - Proof and signal</div>
                <Proof />
                <Signals />
            </div>
        </div>
      )
}

type FormData = {
    signal: string;
}

function Proof() {
    const { register, handleSubmit } = useForm<FormData>()
    const queryClient = useQueryClient();
    const { id, groupWrapper } = useConnectedSemaphore();
    const { signer } = useWalletSigner();

    const mutation = useMutation(async ({ signal }: FormData) => {
        if (!groupWrapper) {
            throw new Error("Oh no, it is broken :(")
        }

        const fullProof = await generateProof(id, groupWrapper.group, groupWrapper.group.root, signal, {
            wasmFilePath: `${process.env.PUBLIC_URL}/semaphore.wasm`,
            zkeyFilePath: `${process.env.PUBLIC_URL}/semaphore.zkey`,
        });

        const semaphoreContractArtifacts = contractStore.getContract(SUPPORTED_NETWORK, "SEMAPHORE");
        const semaphoreContract = new ethers.Contract(
            semaphoreContractArtifacts.address,
            semaphoreContractArtifacts.abi,
            signer
        );

        console.log("SIGNAL: ", signal);
        console.log("PROOF: ", fullProof)
        const tx = await semaphoreContract.verifyProof(GROUP_ID, ethers.utils.arrayify(signal), id.getNullifier(), groupWrapper.group.root, [
            ...fullProof.proof.pi_a,
            ...fullProof.proof.pi_b,
            ...fullProof.proof.pi_c,
        ]);
        await tx.wait();
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries(["group", { id: GROUP_ID }, "signals"]);
        }
    })
    return (
        <div>
            <form onSubmit={handleSubmit(data => mutation.mutate(data))}>
                <input {...register("signal")} />
                <input type="submit" />
            </form>
        </div>
    )
}

function Signals() {
    const { signer } = useWalletSigner();
    const query = useQuery(["group", { id: GROUP_ID }, "signals"], async () => {
        const semaphoreContractArtifacts = contractStore.getContract(SUPPORTED_NETWORK, "SEMAPHORE");
        const semaphoreContract = new ethers.Contract(
            semaphoreContractArtifacts.address,
            semaphoreContractArtifacts.abi,
            signer
        );

        const events = await semaphoreContract.queryFilter(
            semaphoreContract.filters.ProofVerified(GROUP_ID),
        );
        console.log("EVENTS: ", events);
        return events;
    }, {
        refetchInterval: 1000
    })
    return (
        <div>
            {query.data?.length} emitted signals:
        </div>
    )
}

export default ProofPage;