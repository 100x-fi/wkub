import { ethers, waffle } from "hardhat"
import { Signer } from "ethers"
import { WKUB, WKUB__factory } from "../typechain"
import chai from "chai"
import { solidity } from "ethereum-waffle"

chai.use(solidity)

const { expect } = chai

describe("WKUB", () => {
  // WKUB instance
  let wkub: WKUB

  // Signers
  let deployer: Signer
  let alice: Signer

  // Signer with contract
  let wkubAsAlice: WKUB

  beforeEach(async () => {
    [deployer, alice] = await ethers.getSigners()

    // Deploy WKUB
    const WKUB = (await ethers.getContractFactory("WKUB", deployer)) as WKUB__factory
    wkub = await WKUB.deploy()
    await wkub.deployed()

    // Connect signer with instance
    wkubAsAlice = WKUB__factory.connect(wkub.address, alice)
  })

  it('should wrap KUB to WKUB when a user transfer KUB to it directly', async() => {
    await deployer.sendTransaction({
      to: wkub.address,
      value: ethers.utils.parseEther('888')
    })
    expect(await wkub.balanceOf(await deployer.getAddress())).to.eq(ethers.utils.parseEther('888'))
  })

  it('should wrap KUB to WKUB when a user deposit KUB through deposit function', async() => {
    await wkub.deposit({ value: ethers.utils.parseEther('888') })
    expect(await wkub.balanceOf(await deployer.getAddress())).to.eq(ethers.utils.parseEther('888'))
  })

  it('should unwrap WKUB to KUB when a user withdraw it', async() => {
    const kubBefore = await deployer.getBalance()
    await wkub.deposit({ value: ethers.utils.parseEther('888'), gasPrice: 0 })
    expect(await wkub.balanceOf(await deployer.getAddress())).to.eq(ethers.utils.parseEther('888'))

    await wkub.withdraw(await wkub.balanceOf(await deployer.getAddress()), { gasPrice: 0 })
    expect(await deployer.getBalance()).to.be.eq(kubBefore)
  })

  it('should transfer to another account', async() => {
    await wkub.deposit({ value: ethers.utils.parseEther('888'), gasPrice: 0 })
    expect(await wkub.balanceOf(await deployer.getAddress())).to.eq(ethers.utils.parseEther('888'))

    await wkub.transfer("0x88888344157c62D161bA7F98f8774bF9115C766b", ethers.utils.parseEther('888'))
    expect(await wkub.balanceOf("0x88888344157c62D161bA7F98f8774bF9115C766b")).to.be.eq(ethers.utils.parseEther('888'))
  })

  it('should allow another account to spend user\'s wKUB if a user approve', async() => {
    await wkub.deposit({ value: ethers.utils.parseEther('888'), gasPrice: 0 })
    expect(await wkub.balanceOf(await deployer.getAddress())).to.eq(ethers.utils.parseEther('888'))

    await wkub.approve(await alice.getAddress(), ethers.utils.parseEther('555'))
    await wkubAsAlice.transferFrom(await deployer.getAddress(), "0x88888344157c62D161bA7F98f8774bF9115C766b", ethers.utils.parseEther('555'))
    expect(await wkub.balanceOf("0x88888344157c62D161bA7F98f8774bF9115C766b")).to.be.eq(ethers.utils.parseEther('555'))
    expect(await wkub.allowance(await deployer.getAddress(), await alice.getAddress())).to.be.eq('0')
  })

  it('should revert when another account try to over spend the given allowance', async() => {
    await wkub.deposit({ value: ethers.utils.parseEther('888'), gasPrice: 0 })
    expect(await wkub.balanceOf(await deployer.getAddress())).to.eq(ethers.utils.parseEther('888'))

    await wkub.approve(await alice.getAddress(), ethers.utils.parseEther('555'))
    await expect(
      wkubAsAlice.transferFrom(
        await deployer.getAddress(),
        "0x88888344157c62D161bA7F98f8774bF9115C766b",
        ethers.utils.parseEther('888'))).to.be.revertedWith("WKUB::transferFrom::insufficient allowance")
  })

  it('should revert when a user try to withdraw over the balance', async() => {
    await expect(wkub.withdraw(ethers.utils.parseEther('8888'))).to.be.revertedWith('WKUB::withdraw::insufficient balance')
  })

  it('should revert when a user try to transfer over the balance', async() => {
    await expect(wkub.transfer("0x88888344157c62D161bA7F98f8774bF9115C766b", ethers.utils.parseEther('8888'))).to.be.revertedWith('WKUB::transferFrom::insufficient balance')
  })
})